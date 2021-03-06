import * as vscode from 'vscode';

function config(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('rust-assist');
}

export function diagnosticsOnStartup(): boolean {
    return config().get('diagnosticsOnStartup', true);
}

export function diagnosticsOnSave(): boolean {
    return config().get('diagnosticsOnSave', true);
}

export function formatOnSave(): boolean {
    return config().get('formatOnSave', false);
}

export enum FormatMode {
    Backup = 'backup',
    Overwrite = 'overwrite'
}

export function formatMode(): FormatMode {
    return config().get('formatMode', FormatMode.Overwrite);
}
