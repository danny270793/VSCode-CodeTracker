import * as vscode from 'vscode';

function msToTime(duration: number): string {
    const milliseconds: number = (duration % 1000) / 100;
	const seconds: number = Math.floor((duration / 1000) % 60);
    const minutes: number = Math.floor((duration / (1000 * 60)) % 60)
    const hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const hoursText: string = (hours < 10) ? "0" + hours : `${hours}`;
    const minutesText: string = (minutes < 10) ? "0" + minutes : `${minutes}`;
    const secondsText: string = (seconds < 10) ? "0" + seconds : `${seconds}`;

    return hoursText + ":" + minutesText + ":" + secondsText;
}

interface FileTrack {
	fileName: string;
    openedAt: number;
    timeSpent: number;
}

const fileTracking: { [fileName: string]: FileTrack } = {};
let activeFile: FileTrack | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
        const fileName = document.fileName;
        if (!fileTracking[fileName]) {
            fileTracking[fileName] = {
				fileName: document.fileName,
                openedAt: Date.now(),
                timeSpent: 0,
            };
        }
    });

	vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor|undefined) => {
        if (activeFile !== undefined && editor?.document.fileName !== activeFile.fileName) {
            activeFile.openedAt = Date.now();
            activeFile.timeSpent += activeFile.openedAt - activeFile.openedAt;
        }

        if (editor !== undefined) {
            const fileName: string = editor.document.fileName;
            activeFile = fileTracking[fileName] || null;

            if (activeFile !== undefined) {
                activeFile.openedAt = Date.now();
            }
        }
    });

	vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
        const trackedFile: FileTrack|undefined = fileTracking[document.fileName];
        if (trackedFile !== undefined) {
            trackedFile.timeSpent += Date.now() - trackedFile.openedAt;
			const fileParts: string[] = document.fileName.split('\\');
			vscode.window.showInformationMessage(`${msToTime(trackedFile.timeSpent)} on ${fileParts[fileParts.length - 1]}`);
            delete fileTracking[document.fileName];
        }
    });

	context.subscriptions.push(vscode.commands.registerCommand('codetracker.showTime', () => {
		vscode.window.showInformationMessage(`Measuring time`);

		/*
        if (activeFile) {
            const timeSpent = Date.now() - activeFile.openedAt + activeFile.timeSpent;
            vscode.window.showInformationMessage(`Time spent on ${activeFile.fileName}: ${msToTime(timeSpent)}`);
        } else {
            vscode.window.showInformationMessage("No active file being tracked.");
        }
		*/
    }));

	/*
	console.log('Congratulations, your extension "codetracker" is now active!');
	vscode.window.showInformationMessage(`Hello ${vscode.workspace.name}`);

	const times: any = {};

	vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
		if(document.fileName.endsWith('.git')) {
			return;
		}

		vscode.window.showInformationMessage(`Opening ${document.fileName}`);
		times[document.fileName] = Date.now();
	});

	vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
		if(document.fileName.endsWith('.git')) {
			return;
		}

		const elapsed: number = Date.now() - times[document.fileName];
		vscode.window.showInformationMessage(`After ${msToTime(elapsed)} closing ${document.fileName}`);
		times[document.fileName] = undefined;
	});
	*/

	/*
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		const text: string = document.getText();
		const start: number|undefined = times[document.fileName];
		if(start === undefined) {
			vscode.window.showInformationMessage(`file renamed ${document.fileName}`);
		} else {
			const elapsed: number = Date.now() - start;
			vscode.window.showInformationMessage(`${msToTime(elapsed)} on file ${document.fileName}`);
		}
		times[document.fileName] = Date.now();
	});
	*/
}

export function deactivate() {}
