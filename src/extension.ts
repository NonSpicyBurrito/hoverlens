import * as vscode from 'vscode'
import { getDecorations } from './decoration'
import { debounce } from './utils'

export function activate(context: vscode.ExtensionContext) {
    let tokenSource: vscode.CancellationTokenSource

    let currentDecorations: Awaited<ReturnType<typeof getDecorations>> = []

    const updateDecorations = debounce(
        async (event: vscode.TextEditorSelectionChangeEvent) => {
            tokenSource = new vscode.CancellationTokenSource()

            const token = tokenSource.token
            const decorations = await getDecorations(
                event.textEditor,
                event.selections
            )
            if (token.isCancellationRequested) return

            currentDecorations.forEach(([, type]) => type.dispose())

            currentDecorations = decorations
            currentDecorations.forEach(([editor, type, line]) =>
                editor.setDecorations(type, [
                    new vscode.Selection(line, 0, line, 0),
                ])
            )
        },
        () =>
            vscode.workspace
                .getConfiguration('hoverlens')
                .get('debounceUpdate', 50)
    )

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection((event) => {
            tokenSource?.cancel()
            updateDecorations(event)
        })
    )
}
