import remark from 'remark';
import html from 'remark-html';
import haraway from './plugins/haraway';
import youtube from './plugins/youtube';
import vimeo from './plugins/vimeo';

const parser = remark().use(haraway).use(youtube).use(vimeo).use(html);

export function main () {
	window.onload = () => {
		const source = document.getElementById('source'),
					preview = document.getElementById('preview');

		preview.innerHTML = parse(source.value);

		source.onkeyup = e => {
			preview.innerHTML = parse(source.value);
		}
	};
}

function parse (md) {
	return parser.process(md);
}
