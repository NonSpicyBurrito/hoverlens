import * as vscode from 'vscode'
import {
    changeLeadingSpacesToNonBreaking,
    removeEmptyLines,
    toPlainText,
} from './formatting'
import { getMaxCount, getMaxShift } from './config'

export type Decoration = {
    editor: vscode.TextEditor
    type: vscode.TextEditorDecorationType
    line: number
}

export const getDecorations = async (
    editor: vscode.TextEditor,
    selections: readonly vscode.Selection[]
) => {
    if (!selections.length) return []

    const maxCount = getMaxCount()
    if (maxCount > 0 && selections.length > maxCount) return []

    const positions = selections
        .map((selection) => selection.active)
        .sort((a, b) => b.line - a.line || b.character - a.character)

    const hovers = await Promise.all(
        positions.map((position) =>
            vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider',
                editor.document.uri,
                position
            )
        )
    )
    const lines = hovers.map((hovers) =>
        hovers.map(toPlainText).map(removeEmptyLines).join('\n').split('\n')
    )

    const maxShift = getMaxShift()

    const tabWidth = editor.options.tabSize as number

    const getLineLength = (line: number) => {
        let length = 0
        for (const c of editor.document.lineAt(line).text) {
            length += c === '\t' ? tabWidth : 1
        }

        return length
    }

    const layouts = positions.map((position, i) => {
        const paddings: number[] = []

        const space =
            (i == 0 ? editor.document.lineCount : positions[i - 1].line) -
            position.line
        const count = Math.min(lines[i].length, space)

        const startLineLength =
            getLineLength(position.line) + Math.max(maxShift, 0)
        for (let i = 0; i < count; i++) {
            const lineLength = getLineLength(position.line + i)
            if (lineLength > startLineLength) break

            paddings.push(startLineLength - lineLength)
        }

        const min = Math.min(...paddings)
        return paddings.map((padding) => padding - min)
    })

    const texts = layouts.map((paddings, i) => {
        const texts = lines[i].slice(0, paddings.length)
        if (lines[i].length > paddings.length) {
            texts[texts.length - 1] += ' ...'
        }

        return texts
    })

    return layouts.flatMap((paddings, i) =>
        paddings.map((padding, j) => ({
            editor,
            type: createDecorationType(texts[i][j], padding),
            line: positions[i].line + j,
        }))
    )
}

const createDecorationType = (text: string, padding: number) =>
    vscode.window.createTextEditorDecorationType({
        after: {
            contentText: changeLeadingSpacesToNonBreaking(
                ' '.repeat(padding) + text
            ),
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 0 0 2em',
        },

        isWholeLine: true,
    })
