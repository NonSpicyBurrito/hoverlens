import * as vscode from 'vscode'

export const getMaxCount = () =>
    vscode.workspace.getConfiguration('hoverlens').get('maximumCursorCount', 3)

export const getDebounceUpdate = () =>
    vscode.workspace.getConfiguration('hoverlens').get('debounceUpdate', 50)

export const getMaxShift = () =>
    vscode.workspace.getConfiguration('hoverlens').get('maximumShiftCount', 20)
