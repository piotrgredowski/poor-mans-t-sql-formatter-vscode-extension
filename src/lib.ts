import * as vscode from 'vscode';
import { TextEditor } from 'vscode';
import { ExtensionOptions } from './extension-options';
const sqlFormatter = require('poor-mans-t-sql-formatter');

export interface ISqlFormatterResult {
  errorFound: boolean;
  text: string;
}

function getWholeDocRange(doc: vscode.TextDocument) {
  var firstLine = doc.lineAt(0);
  var lastLine = doc.lineAt(doc.lineCount - 1);
  return new vscode.Range(firstLine.range.start, lastLine.range.end);
}

function collectOptions(
  extensionOptions: vscode.WorkspaceConfiguration,
  editorOptions: vscode.FormattingOptions,
): ExtensionOptions {
  const options: ExtensionOptions = { ...extensionOptions.min, ...extensionOptions.std };

  if (editorOptions.insertSpaces) {
    if (editorOptions.tabSize) {
      options.spacesPerTab = editorOptions.tabSize;
      options.indent = ' '.repeat(editorOptions.tabSize);
    }
  } else {
    editorOptions.indent = '\t';
    editorOptions.spacesPerTab = editorOptions.tabSize;
  }

  if (options.dontInsertErrorOutput) {
    options.errorOutputPrefix = '';
  }
  return options;
}

var commandDisposable: any;

function activate(context: any) {
  commandDisposable = vscode.commands.registerCommand(
    'poor-mans-t-sql-formatter-pg.formatSql',
    () => {},
  );

  context.subscriptions.push(commandDisposable);
}
exports.activate = activate;

function deactivate() {
  if (commandDisposable) {
    commandDisposable.dispose();
  }
}
exports.deactivate = deactivate;

export function formatDocument(editorFormattingOptions: vscode.FormattingOptions) {
  let editor = vscode.window.activeTextEditor as TextEditor;
  let document = editor.document;
  let useSelection = !editor.selection.isEmpty;
  let inputSql = useSelection ? document.getText(editor.selection) : document.getText();

  const selectionRange = useSelection
    ? new vscode.Range(editor.selection.start, editor.selection.end)
    : getWholeDocRange(document);

  let extensionSettingsObject = vscode.workspace.getConfiguration('poor-mans-t-sql-formatter-pg');
  let options = collectOptions(extensionSettingsObject, editorFormattingOptions);

  try {
    const formatDespiteMismatch = new Promise((resolve, reject) => {
      if (
        extensionSettingsObject.expectedLanguages &&
        !extensionSettingsObject.expectedLanguages.find(
          (l: any) => l === document.languageId || l === '*',
        )
      ) {
        vscode.window
          .showWarningMessage(
            "The language of the file you are attempting to format does not match the formatter's configuration. Would you like to format anyway?",
            'Format Anyway',
          )
          .then((selectedAction) => {
            if (selectedAction === 'Format Anyway') {
              resolve(true);
            } else {
              resolve(false);
            }
          });
      } else {
        resolve(true);
      }
    });
    if (!formatDespiteMismatch) {
      return;
    }

    const result = sqlFormatter.formatSql(inputSql, options) as ISqlFormatterResult;

    return [vscode.TextEdit.replace(selectionRange, result.text)];

  } catch (e) {
    console.log(e);
    throw e;
  }
}
