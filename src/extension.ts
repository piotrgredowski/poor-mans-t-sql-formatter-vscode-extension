// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { formatDocument } from './lib';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'poor-mans-t-sql-formatter-pg.formatSql',
    () => {
      return formatDocument({} as vscode.FormattingOptions);
    },
  );

  context.subscriptions.push(disposable);

  vscode.languages.registerDocumentFormattingEditProvider('sql', {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument,
      options: vscode.FormattingOptions,
    ): vscode.TextEdit[] {
      const result = formatDocument(options);
      if (result !== undefined) {
        return result;
      } else {
        return [];
      }
    },
  });
}

export function deactivate() {}
