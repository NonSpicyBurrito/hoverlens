import * as vscode from 'vscode'
import { getDecorations } from './decoration'

export function activate(context: vscode.ExtensionContext) {
    let tokenSource: vscode.CancellationTokenSource

    let currentDecorations: Awaited<ReturnType<typeof getDecorations>> = []

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(async (event) => {
            tokenSource?.cancel()
            tokenSource = new vscode.CancellationTokenSource()

            const token = tokenSource.token
            const decorations = await getDecorations(
                event.textEditor,
                event.selections
            )
            if (token.isCancellationRequested) return

            currentDecorations.forEach(([editor, type]) =>
                editor.setDecorations(type, [])
            )

            currentDecorations = decorations
            currentDecorations.forEach(([editor, type, line]) =>
                editor.setDecorations(type, [
                    new vscode.Selection(line, 0, line, 0),
                ])
            )
        })
    )
}
