export default function (block) {
  const type = block.getType();
  switch (type) {
    case 'blockquote':
      return 'editorBlockQuote';
    case 'code-block':
      return 'editorCode';
    default:
      return null;
  }
}
