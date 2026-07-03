import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Code,
    Heading2,
    Heading3,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Undo2,
} from 'lucide-react';

import '../../../css/tiptap-editor.css';

function ToolbarButton({ onClick, active, title, children }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`rounded-md p-2 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 ${
                active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : ''
            }`}
        >
            {children}
        </button>
    );
}

/**
 * TipTap rich text editor — stores HTML in `value` / `onChange`.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(html: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.className] — extra classes on the outer shell
 */
export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write here…',
    className = '',
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Placeholder.configure({ placeholder }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'font-medium',
                },
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'prose-custom',
            },
        },
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            onChange(html === '<p></p>' ? '' : html);
        },
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const prev = editor.getAttributes('link').href;
        const url = window.prompt('Link URL', prev ?? 'https://');
        if (url === null) {
            return;
        }
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div
            className={`tiptap-editor-shell overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-0 ${className}`}
        >
            <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1">
                <ToolbarButton
                    title="Bold"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Italic"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Strikethrough"
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="size-4" aria-hidden />
                </ToolbarButton>
                <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
                <ToolbarButton
                    title="Heading 2"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    <Heading2 className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Heading 3"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    <Heading3 className="size-4" aria-hidden />
                </ToolbarButton>
                <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
                <ToolbarButton
                    title="Bullet list"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Numbered list"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Quote"
                    active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Code block"
                    active={editor.isActive('codeBlock')}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                    <Code className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Horizontal rule"
                    active={false}
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus className="size-4" aria-hidden />
                </ToolbarButton>
                <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
                <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
                    <LinkIcon className="size-4" aria-hidden />
                </ToolbarButton>
                <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
                <ToolbarButton
                    title="Undo"
                    active={false}
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <Undo2 className="size-4" aria-hidden />
                </ToolbarButton>
                <ToolbarButton
                    title="Redo"
                    active={false}
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <Redo2 className="size-4" aria-hidden />
                </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
