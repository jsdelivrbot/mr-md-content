import visit from 'unist-util-visit';

export function transformer(ast, file) {
	visit(ast, 'image', function (node) {
		if (node.src.includes('youtube://')) {
			node.type = 'html';
			node.value = `<iframe width="420" height="235" src="https://www.youtube.com/embed/${node.src.replace('youtube://', '')}" frameborder="0" allowfullscreen></iframe>`;
		}
	});
}

function attacher() {
	return transformer;
}

export default attacher;