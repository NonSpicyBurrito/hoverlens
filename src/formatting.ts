import markdownToTxt from 'markdown-to-txt'
import * as vscode from 'vscode'

export const toPlainText = (hover: vscode.Hover) =>
    hover.contents
        .map((content) =>
            content instanceof vscode.MarkdownString
                ? markdownToTxt(content.value)
                : typeof content === 'string'
                ? markdownToTxt(content)
                : content.value
        )
        .join('\n')

export const removeEmptyLines = (text: string) =>
    text
        .split('\n')
        .filter((line) => !!line)
        .join('\n')

export const changeLeadingSpacesToNonBreaking = (line: string) => {
    let i = 0
    for (; i < line.length; i++) {
        if (line[i] !== ' ') break
    }

    return '\xa0'.repeat(i) + line.slice(i)
}
