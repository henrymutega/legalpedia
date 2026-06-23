import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote, Link2, Image as ImageIcon,
  Undo2, Redo2, Minus, Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

const Btn = ({ active, onClick, children, title }: any) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      'inline-flex items-center justify-center h-8 w-8 rounded border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
      active && 'bg-muted text-foreground border-border',
    )}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange, placeholder, className }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-gold underline underline-offset-2' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-md my-3' } }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[280px] focus:outline-none px-4 py-3',
      },
    },
  });

  // Sync external value changes (e.g., switching language tabs)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(value || { type: 'doc', content: [] })) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('URL');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const setImage = () => {
    const url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className={cn('border border-border rounded-md bg-background', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5 bg-muted/30">
        <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></Btn>
        <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></Btn>
        <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></Btn>
        <Btn title="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={14} /></Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></Btn>
        <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></Btn>
        <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></Btn>
        <Btn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn title="Link" active={editor.isActive('link')} onClick={setLink}><Link2 size={14} /></Btn>
        <Btn title="Image" onClick={setImage}><ImageIcon size={14} /></Btn>
        <span className="ml-auto flex items-center gap-0.5">
          <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={14} /></Btn>
          <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={14} /></Btn>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
