
class Componente extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			edit: false,
			model: {
					// Data blobs files
					obj: { /* ... */ },
					mtl: { /* ... */ },
					texture: { /* ... */ },
			},
			annotations: [
				{
					text: 'Aurícula derecha',
					pointPosition: [232, 123, 542],
					labelPosition: [1, 2, 3],
					selected: true, // is selected
					show: true, // is visible,
				},
				{
					text: 'Aurícula izquierda',
					pointPosition: [[232, 123, 542], [123, 432, 132]],
					labelPosition: [1, 2, 3],
					selected: false, // unique
					show: false,
				},
			],
		}
		this.onClick = this.onClick.bind(this);
	}

	onClick(position) {
		const newAnnotation = {
			position: position,
			active: true,
			text: 'New Annotaion',
		}
		// Add new annotation and re-render component
		this.setState({ annotations: [...annotations, newAnnotation] })
	}

	render() {
		return (
			<div>
				{/* Add onChange event is needed */}
				<input ref="filesInput" type="file" multiple></input>
				<ThreeJS
					edit={this.state.edt}
					style={styles.view}
					source={{ uris: this.state.uris }}
					annotations={this.state.annotations}
					annotationStyle={styles.annotation}
					activeAnnotationStyle={styles.active}
					onClick={this.onClick}
				/>
			</div>
		)
	}
}


const styles = {
	view: {
		width: 100,
		height: 100,
	},
	annotations: {
		fontFamily: 'Helvetica',
		color: 'white',
	},
	active: {
		// fontFamily: 'Helvetica' is inhered by 'annotation' style.
		color: 'red',
	},
}
