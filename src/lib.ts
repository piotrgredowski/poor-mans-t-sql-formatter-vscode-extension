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
  return new vscode.Range(
    0,
    firstLine.range.start.character,
    doc.lineCount - 1,
    lastLine.range.end.character,
  );
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
  let selectionActivePoint = editor.selection.active;
  let inputSql = useSelection ? document.getText(editor.selection) : document.getText();

  let oldOffset = document.offsetAt(selectionActivePoint);
  let oldOffsetPercent = inputSql.length === 0 ? 0 : oldOffset / inputSql.length;

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
    const formatDespiteError = new Promise((resolve1, reject1) => {
      if (extensionSettingsObject.confirmOnError && result.errorFound) {
        vscode.window
          .showWarningMessage(
            'The content you are attempting to format was not successfully parsed, and the formatted result may not match the original intent. Would you like to format anyway?',
            'Format Anyway',
          )
          .then((selectedAction1) => {
            if (selectedAction1 === 'Format Anyway') {
              resolve1(true);
            } else {
              resolve1(false);
            }
          });
      } else {
        resolve1(true);
      }
    });
    return result.text;
    // const choice = Promise.resolve(formatDespiteError);
    // const final = choice.then(function (c) {
    //   if (c) {
    //     return result.text;
    //     // editor
    //     //   .edit((mutator) => {
    //     //     mutator.replace(
    //     //       useSelection ? editor.selection : getWholeDocRange(document),
    //     //       result.text,
    //     //     );
    //     //   })
    //     //   .then((editCompleted) => {
    //     //     if (!useSelection) {
    //     //       //put the cursor back in approximately the same (relative) place we found it...
    //     //       let newOffset = oldOffsetPercent * result.text.length;
    //     //       let newPosition = document.positionAt(newOffset);
    //     //       editor.selection = new vscode.Selection(newPosition, newPosition);
    //     //     }
    //     //   });
    //   } else {
    //     return '';
    //   }
    //   //   return result;
    // });
    // return final;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
