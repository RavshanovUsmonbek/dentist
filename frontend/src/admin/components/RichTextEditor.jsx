const RichTextEditor = ({ value, onChange, placeholder = "Enter text..." }) => {
  // Convert HTML to plain text with line breaks for editing
  const htmlToText = (html) => {
    if (!html) return '';
    return html
      .replace(/<\/p><p>/g, '\n\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/<br\s*\/?>/g, '\n');
  };

  // Convert plain text with line breaks to HTML paragraphs
  const textToHtml = (text) => {
    if (!text) return '';
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p style="margin-bottom: 1rem;">${p.replace(/\n/g, '<br>')}</p>`).join('');
  };

  const handleChange = (e) => {
    const text = e.target.value;
    const html = textToHtml(text);
    onChange(html);
  };

  return (
    <div className="rich-text-editor">
      <textarea
        value={htmlToText(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-sans"
        rows={12}
        style={{ minHeight: '200px' }}
      />
      <p className="text-xs text-gray-500 mt-2">
        Press Enter twice to create a new paragraph. Single line breaks will be preserved.
      </p>
    </div>
  );
};

export default RichTextEditor;
