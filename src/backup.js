const vscode = require('vscode');
const sqlFormatter = require('poor-mans-t-sql-formatter-pg');

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

function getWholeDocRange(doc) {
  var firstLine = doc.lineAt(0);
  var lastLine = doc.lineAt(doc.lineCount - 1);
  return new vscode.Range(0, firstLine.range.start.character, doc.lineCount - 1, lastLine.range.end.character);
}

function mergeInProperties(targetObject, sourceObject) {
  for (var attrname in sourceObject) {
    targetObject[attrname] = sourceObject[attrname];
  }
}

function collectOptions(extensionOptions) {
  var optionsReturn = {
    "errorOutputPrefix": extensionOptions.errorOutputPrefix,
    "formattingType": extensionOptions.formattingType
  };
  mergeInProperties(optionsReturn, extensionOptions.min);
  mergeInProperties(optionsReturn, extensionOptions.std);
  return optionsReturn;
}

var commandDisposable;

function activate(context) {
  commandDisposable = vscode.commands.registerCommand('poor-mans-t-sql-formatter-pg.formatSql', () => {
    let editor = vscode.window.activeTextEditor;
    let doc = editor.document;

    let useSelection = !editor.selection.isEmpty;
    let selectionActivePoint = editor.selection.active;
    let inputSql = useSelection ? doc.getText(editor.selection) : doc.getText();

    let oldOffset = doc.offsetAt(selectionActivePoint);
    let oldOffsetPercent = inputSql.length == 0 ? 0 : (oldOffset / inputSql.length);

    let libResult;

    let extensionSettingsObject = vscode.workspace.getConfiguration("poor-mans-t-sql-formatter-pg");

    return new Promise((resolve, reject) => {
      if (extensionSettingsObject.expectedLanguages
        && !extensionSettingsObject.expectedLanguages.find(l => l === doc.languageId || l === "*")
        )
        vscode.window.showWarningMessage("The language of the file you are attempting to format does not match the formatter's configuration. Would you like to format anyway?", "Format Anyway")
        .then(selectedAction => {
          if (selectedAction === "Format Anyway")
            resolve(true);
          else
            resolve(false);
        });
      else
        resolve(true);

    }).then(formatDespiteMismatch => {
      if (!formatDespiteMismatch)
        return;

      libResult = sqlFormatter.formatSql(inputSql, collectOptions(extensionSettingsObject));

      return new Promise((resolve, reject) => {
      if (extensionSettingsObject.confirmOnError
        && libResult.errorFound
        )
        vscode.window.showWarningMessage("The content you are attempting to format was not successfully parsed, and the formatted result may not match the original intent. Would you like to format anyway?", "Format Anyway")
        .then(selectedAction => {
          if (selectedAction === "Format Anyway")
            resolve(true);
          else
            resolve(false);
        });
      else
        resolve(true);
      }).then(formatDespiteError => {
        if (formatDespiteError) {
          editor.edit(mutator => {
            mutator.replace(useSelection ? editor.selection : getWholeDocRange(doc), libResult.text)
          }).then(editCompleted => {
              if (!useSelection) {
                //put the cursor back in approximately the same (relative) place we found it...
                let newOffset = oldOffsetPercent * libResult.text.length;
                let newPosition = doc.positionAt(newOffset);
                editor.selection = new vscode.Selection(newPosition, newPosition);
              }
          });
        }
      });
    }).catch(e => {console.log(e); throw e;});
  });

  context.subscriptions.push(commandDisposable);
}
exports.activate = activate;

function deactivate() {
  if (commandDisposable)
    commandDisposable.dispose();
}
exports.deactivate = deactivate;
