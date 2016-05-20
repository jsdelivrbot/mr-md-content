import visit from 'unist-util-visit';

export function transformer(ast, file) {
	visit(ast, 'image', function (node) {
		if (node.src.includes('vimeo://')) {
			node.type = 'html';
			node.value = `<iframe width="420" height="235" src="https://player.vimeo.com/video/${node.src.replace('vimeo://', '')}?title=0&byline=0&portrait=0" frameborder="0" allowfullscreen></iframe>`;
		}
	});
}

function attacher() {
	return transformer;
}

export default attacher;