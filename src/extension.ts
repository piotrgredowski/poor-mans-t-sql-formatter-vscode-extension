// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { formatDocument } from './lib';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "poor-mans-t-sql-formatter-pg" is now active!');

  vscode.window.showInformationMessage(
    'Hello World from poor-mans-t-sql-formatter-vscode-extension-pg!',
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('poor-mans-t-sql-formatter-pg.formatSql', () => {
    return formatDocument(false, undefined);
  });

  context.subscriptions.push(disposable);

  vscode.languages.registerDocumentFormattingEditProvider('sql', {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument,
      options: vscode.FormattingOptions,
    ): vscode.TextEdit[] {
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);

      const result = formatDocument(options.insertSpaces, options.tabSize);
      if (result !== undefined) {
        return [
          vscode.TextEdit.replace(
            new vscode.Range(firstLine.range.start, lastLine.range.end),
            result,
          ),
        ];
      } else {
        return [];
      }
    },
  });
}

export function deactivate() {}
