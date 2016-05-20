import visit from 'unist-util-visit';

export function transformer(ast, file) {
	visit(ast, 'image', function (node) {
		if (node.src.includes('asset://')) {
			node.src = `//c.assets.sh/${node.src.replace('asset://', '')}`;
		}
	});
}

function attacher() {
	return transformer;
}

export default attacher;