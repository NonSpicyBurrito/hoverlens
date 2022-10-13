import * as vscode from 'vscode'
import {
    changeLeadingSpacesToNonBreaking,
    removeEmptyLines,
    toPlainText,
} from './formatting'

export async function getDecorations(
    editor: vscode.TextEditor,
    selections: readonly vscode.Selection[]
) {
    if (!selections.length) return []
    if (selections.length > 3) return []

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

    const layouts = positions.map((position, i) => {
        const paddings: number[] = []

        const space =
            (i == 0 ? editor.document.lineCount : positions[i - 1].line) -
            position.line
        const count = Math.min(lines[i].length, space)

        const startLineLength = getLineLength(position.line)
        for (let i = 0; i < count; i++) {
            const lineLength = getLineLength(position.line + i)
            if (lineLength > startLineLength) break

            paddings.push(startLineLength - lineLength)
        }

        return paddings
    })

    const texts = layouts.map((paddings, i) => {
        const texts = lines[i].slice(0, paddings.length)
        if (lines[i].length > paddings.length) {
            texts[texts.length - 1] += ' ...'
        }

        return texts
    })

    return layouts
        .map((paddings, i) =>
            paddings.map(
                (padding, j) =>
                    [
                        editor,
                        createDecorationType(texts[i][j], padding),
                        positions[i].line + j,
                    ] as const
            )
        )
        .flat()

    function getLineLength(line: number) {
        return editor.document.lineAt(line).range.end.character
    }
}

function createDecorationType(text: string, padding: number) {
    return vscode.window.createTextEditorDecorationType({
        after: {
            contentText: changeLeadingSpacesToNonBreaking(
                ' '.repeat(padding) + text
            ),
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            margin: '0 0 0 2em',
        },

        isWholeLine: true,
    })
}
