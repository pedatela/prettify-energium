// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('extension.prettifyEnergium', function () {

		const editor = vscode.window.activeTextEditor
		const docText = editor.document.getText();

		try {
			let paciente = extract_patient(docText);
			let tubos = extract_tubes(docText);
			editor.edit(builder => {
				builder.replace(
					new vscode.Range(
						new vscode.Position(0, 0), 
						new vscode.Position(docText.length, docText.length)
					), 
					`${paciente}\n${tubos}`)
			})

		} catch (error) {
			console.log("E: ", error)
			const diagnostic = new vscode.Diagnostic(selectedRange, `[string-transformer]: ${error.message}`, vscode.DiagnosticSeverity.Error);
			diagnosticCollection.set(editor.document.uri, [diagnostic]);
		}

	});

	context.subscriptions.push(disposable);
}

function extract_patient_field(txt, separator) {
    let field = '';
    let start_index = txt.indexOf(separator);

    if (start_index != -1) {
        let start_txt = txt.indexOf(separator) + separator.length;

        let substring = txt.substring(start_txt);

        for(let index in substring) {
            if(substring.charAt(index) === '^') {
                break;
            }else {
                field += substring.charAt(index);
            }
        }

        return field;
    }

    return '';
}

function extract_patient(txt){
    let patient_raw = txt.substring(
        txt.indexOf('^^^P')+4, 
        txt.indexOf('^^^_P')
    );
	return (
`^^^P
	^PI${extract_patient_field(patient_raw, '^PI')}
	^WO${extract_patient_field(patient_raw, '^WO')}
	^PN${extract_patient_field(patient_raw, '^PN')}
	^PBD${extract_patient_field(patient_raw, '^PBD')}
	^P1${extract_patient_field(patient_raw, '^P1')}
	^PS${extract_patient_field(patient_raw, '^PS')}
	^PA${extract_patient_field(patient_raw, '^PA')}
	^SW${extract_patient_field(patient_raw, '^SW')}
	^PB${extract_patient_field(patient_raw, '^PB')}
^^^_P`);
}

function extract_tubes(string_txt) {
	let tubes_raw = string_txt.substring(
		string_txt.indexOf('^^^S') + 4,
		string_txt.indexOf('^^^_S'));
	let tubes = '^^^S\n';

	tubes_raw.split('^SS').slice(1).forEach(tube_raw => {
		tubes += (
`	^SS
		^TC${extract_patient_field(tube_raw, '^TC')}
 		^T0${extract_patient_field(tube_raw, '^T0')}
 		^TN${extract_patient_field(tube_raw, '^TN')}
 		^EA${extract_patient_field(tube_raw, '^EA')}
 		^TQ${extract_patient_field(tube_raw, '^TQ')}
 		^TS${extract_patient_field(tube_raw, '^TS')}
 		^TL${extract_patient_field(tube_raw, '^TL')}
		^TED${extract_patient_field(tube_raw, '^TED')}
	^_SS
`);
	});
	return tubes + '^^^_S';
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
