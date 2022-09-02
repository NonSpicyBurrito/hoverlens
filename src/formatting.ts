import markdownToTxt from 'markdown-to-txt'
import * as vscode from 'vscode'

export function toPlainText(hover: vscode.Hover) {
    return hover.contents
        .map((content) => {
            if (content instanceof vscode.MarkdownString) {
                return markdownToTxt(content.value)
            } else {
                return typeof content === 'string'
                    ? markdownToTxt(content)
                    : content.value
            }
        })
        .join('\n')
}

export function removeEmptyLines(text: string) {
    return text
        .split('\n')
        .filter((line) => !!line)
        .join('\n')
}

export function changeLeadingSpacesToNonBreaking(line: string) {
    let i = 0
    for (; i < line.length; i++) {
        if (line[i] !== ' ') break
    }

    return '\xa0'.repeat(i) + line.slice(i)
}
