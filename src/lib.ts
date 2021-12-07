import * as vscode from 'vscode';
import { TextEditor } from 'vscode';
const sqlFormatter = require('poor-mans-t-sql-formatter');

/* work:
 - options - integration / manual testing
 - VSCode env/integration concerns
   - options nesting (std formatter options, obfuscation / minifier options) -> maybe not possible, see https://github.com/editor-rs/vscode-rust/issues/341
   - dynamically defined options list (to avoid hardcoding in this extension) -> maybe not possible
   - menu "when" expression syntax to add plaintext option
   - menu "when" expression syntax to add plaintext option to context menu
   - title context and explorer context support fix
   - UI language / translation
   - Switch to "registerTextEditorCommand" rather than "registerCommand" (I couldn't figure out how to apply the edit in the handler so as to mess with the cursor selection afterwards)
   - detect read-only buffers, warn or something to expolain why nothing is happening?
 - auto testing
 */

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

function mergeInProperties(targetObject: any, sourceObject: any) {
  for (var attrname in sourceObject) {
    targetObject[attrname] = sourceObject[attrname];
  }
}

function collectOptions(extensionOptions: vscode.WorkspaceConfiguration) {
  var optionsReturn = {
    errorOutputPrefix: extensionOptions.errorOutputPrefix,
    formattingType: extensionOptions.formattingType,
  };
  mergeInProperties(optionsReturn, extensionOptions.min);
  mergeInProperties(optionsReturn, extensionOptions.std);
  return optionsReturn;
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

export function formatDocument(useSpaces: boolean, spacesPerTab: number | undefined = undefined) {
  let editor = vscode.window.activeTextEditor as TextEditor;
  let document = editor.document;
  let useSelection = !editor.selection.isEmpty;
  let selectionActivePoint = editor.selection.active;
  let inputSql = useSelection ? document.getText(editor.selection) : document.getText();

  let oldOffset = document.offsetAt(selectionActivePoint);
  let oldOffsetPercent = inputSql.length === 0 ? 0 : oldOffset / inputSql.length;

  let extensionSettingsObject = vscode.workspace.getConfiguration('poor-mans-t-sql-formatter-pg');
  let options: any = collectOptions(extensionSettingsObject);
  if (useSpaces) {
    if (spacesPerTab) {
      options.spacesPerTab = spacesPerTab;
    }
    options.indent = ' '.repeat(spacesPerTab || 4);
    options.spacesPerTab = spacesPerTab;
  } else {
    options.indent = '\t';
    options.spacesPerTab = spacesPerTab;
  }

  if (options.dontInsertErrorOutput) {
    options.errorOutputPrefix = '';
  }

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
