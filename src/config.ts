import * as vscode from 'vscode'

export const getEnabled = () =>
    vscode.workspace.getConfiguration('hoverlens').get('enabled', true)

export const getMaxCount = () =>
    vscode.workspace.getConfiguration('hoverlens').get('maximumCursorCount', 3)

export const getDebounceUpdate = () =>
    vscode.workspace.getConfiguration('hoverlens').get('debounceUpdate', 50)

export const getMaxShift = () =>
    vscode.workspace.getConfiguration('hoverlens').get('maximumShiftCount', 20)
