import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders a dropdown in `document.body` with `position: fixed` so it is not
 * clipped by `overflow-hidden` on tables, cards, or the admin main scroll area.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {React.RefObject<HTMLElement|null>} props.anchorRef — set `anchorRef.current` to the trigger element before opening (e.g. `e.currentTarget`).
 * @param {() => void} props.onClose
 * @param {React.ReactNode} props.children
 * @param {string} [props.panelClassName] — e.g. `w-44` or `w-56 max-h-72`
 */
export default function PortalMenu({
    open,
    anchorRef,
    onClose,
    children,
    panelClassName = 'w-44',
}) {
    const menuRef = useRef(null);
    const [box, setBox] = useState({
        top: 0,
        left: 0,
        maxH: 400,
    });

    useLayoutEffect(() => {
        if (!open) {
            return undefined;
        }
        const anchor = anchorRef?.current;
        if (!anchor) {
            return undefined;
        }

        const update = () => {
            const r = anchor.getBoundingClientRect();
            const el = menuRef.current;
            const mw = el?.offsetWidth ?? 176;
            const mh = el?.offsetHeight ?? 120;
            const pad = 8;
            let left = r.right - mw;
            left = Math.max(pad, Math.min(left, window.innerWidth - mw - pad));
            let top = r.bottom + 4;
            const spaceBelow = window.innerHeight - r.bottom - pad;
            const spaceAbove = r.top - pad;
            if (mh > spaceBelow && spaceAbove > spaceBelow) {
                top = r.top - mh - 4;
            }
            top = Math.max(pad, Math.min(top, window.innerHeight - mh - pad));
            const maxH = Math.max(120, window.innerHeight - top - pad);
            setBox({ top, left, maxH });
        };

        update();
        const raf = requestAnimationFrame(update);
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open, anchorRef]);

    if (!open || typeof document === 'undefined' || !document.body) {
        return null;
    }

    return createPortal(
        <>
            <button
                type="button"
                className="fixed inset-0 z-[90] cursor-default bg-transparent"
                aria-hidden
                onClick={onClose}
            />
            <div
                ref={menuRef}
                role="menu"
                style={{
                    position: 'fixed',
                    top: box.top,
                    left: box.left,
                    zIndex: 100,
                    maxHeight: Math.min(box.maxH, 480),
                }}
                className={`overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg ${panelClassName}`}
            >
                {children}
            </div>
        </>,
        document.body,
    );
}
