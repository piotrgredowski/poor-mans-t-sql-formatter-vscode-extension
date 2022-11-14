import * as vscode from "vscode";
import { formatDocument } from "./lib";

let commandsDisposables: vscode.Disposable[] = [];

function _format(shoudlFormatSelection: boolean) {
  const { activeTextEditor } = vscode.window;
  if (!!activeTextEditor) {
    const options = activeTextEditor.options;
    const editsPromise = formatDocument(
      options as vscode.FormattingOptions,
      shoudlFormatSelection
    );
    editsPromise.then((edit) => {
      if (!!edit) {
        activeTextEditor.edit((editBuilder) => {
          editBuilder.replace(edit[0].range, edit[0].newText);
        });
      }
    });
  }
}
function formatWhole() {
  return _format(false);
}
function formatSelection() {
  return _format(true);
}

export function activate(context: vscode.ExtensionContext) {
  commandsDisposables.push(
    vscode.commands.registerCommand(
      "poor-mans-t-sql-formatter-pg.poorFormatSql",
      () => {
        formatWhole();
      }
    ),
    vscode.commands.registerCommand(
      "poor-mans-t-sql-formatter-pg.poorFormatSelectionSql",
      () => {
        formatSelection();
      }
    )
  );

  context.subscriptions.push(...commandsDisposables);

  vscode.languages.registerDocumentFormattingEditProvider("sql", {
    provideDocumentFormattingEdits(_, options: vscode.FormattingOptions) {
      return formatDocument(options, false);
    },
  });
}

export function deactivate() {
  for (const commandDisposable of commandsDisposables) {
    commandDisposable.dispose();
  }
}
