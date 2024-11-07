import * as vscode from 'vscode';

// Move these to module level
const breakpointDecorations = new Map<string, vscode.TextEditorDecorationType>();
const dbgInjections = new Map<string, vscode.Position>();

export function activate(context: vscode.ExtensionContext) {
    // Register event handlers for when breakpoints are added or removed
    context.subscriptions.push(
        vscode.debug.onDidChangeBreakpoints(async (event) => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !isElixirFile(activeEditor.document)) {
                return;
            }

            // Handle added breakpoints
            for (const bp of event.added) {
                if (bp instanceof vscode.SourceBreakpoint) {
                    await addDbgCall(activeEditor, bp.location);
                }
            }

            // Handle removed breakpoints
            for (const bp of event.removed) {
                if (bp instanceof vscode.SourceBreakpoint) {
                    await removeDbgCall(activeEditor, bp.location);
                }
            }
        })
    );
}

function isElixirFile(document: vscode.TextDocument): boolean {
    return document.languageId === 'elixir';
}

async function addDbgCall(editor: vscode.TextEditor, location: vscode.Location): Promise<void> {
    const line = location.range.start.line;
    const document = editor.document;
    const text = document.lineAt(line).text;

    // Only inject if there isn't already a dbg call
    if (!text.includes('|> dbg()')) {
        const edit = new vscode.WorkspaceEdit();
        const position = new vscode.Position(line, document.lineAt(line).text.length);
        edit.insert(document.uri, position, ' |> dbg()');
        
        await vscode.workspace.applyEdit(edit);
        
        // Store the injection position for later removal
        const key = `${document.uri.toString()}-${line}`;
        dbgInjections.set(key, position);
    }
}

async function removeDbgCall(editor: vscode.TextEditor, location: vscode.Location): Promise<void> {
    const line = location.range.start.line;
    const document = editor.document;
    const key = `${document.uri.toString()}-${line}`;
    
    if (dbgInjections.has(key)) {
        const text = document.lineAt(line).text;
        const dbgIndex = text.lastIndexOf('|> dbg()');
        
        if (dbgIndex !== -1) {
            const edit = new vscode.WorkspaceEdit();
            const range = new vscode.Range(
                new vscode.Position(line, dbgIndex),
                new vscode.Position(line, dbgIndex + ' |> dbg()'.length)
            );
            edit.delete(document.uri, range);
            
            await vscode.workspace.applyEdit(edit);
            dbgInjections.delete(key);
        }
    }
}

export function deactivate() {
    // Clean up any decorations
    breakpointDecorations.forEach(decoration => decoration.dispose());
    breakpointDecorations.clear();
}