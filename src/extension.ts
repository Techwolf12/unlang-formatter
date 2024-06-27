import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.languages.registerDocumentFormattingEditProvider('unlang', {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      const textEdits: vscode.TextEdit[] = [];
      const fullText = document.getText();
      const formattedText = formatUnlang(fullText);
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length)
      );
      textEdits.push(vscode.TextEdit.replace(fullRange, formattedText));
      return textEdits;
    }
  });

  context.subscriptions.push(disposable);

  // Register the command
  const formatCommand = vscode.commands.registerCommand('extension.formatUnlang', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const fullText = document.getText();
      const formattedText = formatUnlang(fullText);
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length)
      );
      editor.edit(editBuilder => {
        editBuilder.replace(fullRange, formattedText);
      });
    }
  });

  context.subscriptions.push(formatCommand);
}

function formatUnlang(text: string): string {
  const lines = text.split('\n');
  const formattedLines: string[] = [];
  let indentLevel = 0;
  const indentSize = 2;
  const indent = (level: number) => ' '.repeat(level * indentSize);

  for (let line of lines) {
    line = line.trim();

    // Handle closing braces
    if (line.startsWith('}')) {
      indentLevel--;
    }

    // Apply indentation
    const formattedLine = indent(indentLevel) + formatLine(line);
    formattedLines.push(formattedLine);

    // Handle opening braces
    if (line.endsWith('{')) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
}

function formatLine(line: string): string {
  // Format keywords and operators
  line = line.replace(/=\s*/g, ' = ');
  line = line.replace(/\s*=\s*/g, ' = ');
  line = line.replace(/>\s*/g, ' > ');
  line = line.replace(/\s*>\s*/g, ' > ');
  line = line.replace(/<\s*/g, ' < ');
  line = line.replace(/\s*<\s*/g, ' < ');
  line = line.replace(/\)\s*{/g, ') {');

  // Format comments
  line = line.replace(/#\s*/g, '# ');

  return line;
}

export function deactivate() {}