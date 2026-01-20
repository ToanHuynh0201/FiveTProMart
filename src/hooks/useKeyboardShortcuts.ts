/**
 * Keyboard Shortcuts Hook for 5TProMart
 * 
 * Provides a unified keyboard shortcut system across the application.
 * Designed for power users and cashiers who need quick actions without mouse.
 * 
 */
import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
	/** The key to listen for (e.g., "Enter", "Escape", "b", "1") */
	key: string;
	/** Modifier keys required */
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	/** The action to perform when the shortcut is triggered */
	action: () => void;
	/** Description for help overlay */
	description?: string;
	/** Whether the shortcut is enabled */
	enabled?: boolean;
	/** Prevent default browser behavior */
	preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
	/** Disable all shortcuts when in an input field */
	disableInInputs?: boolean;
	/** Global shortcuts that work even in modals */
	isGlobal?: boolean;
}

/**
 * Hook to register keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts([
 *   { key: "Enter", action: handleConfirm, description: "Confirm payment" },
 *   { key: "Escape", action: handleClear, description: "Clear cart" },
 *   { key: "b", ctrl: true, action: openScanner, description: "Open barcode scanner" },
 * ]);
 */
export function useKeyboardShortcuts(
	shortcuts: KeyboardShortcut[],
	options: UseKeyboardShortcutsOptions = {}
) {
	const { disableInInputs = true, isGlobal = false } = options;
	
	// Use ref to avoid re-registering listeners when shortcuts change
	const shortcutsRef = useRef(shortcuts);
	shortcutsRef.current = shortcuts;

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Skip if typing in input fields (unless overridden)
			if (disableInInputs) {
				const target = event.target as HTMLElement;
				const tagName = target.tagName.toLowerCase();
				const isInput = tagName === "input" || tagName === "textarea" || target.isContentEditable;
				
				// Allow certain shortcuts even in inputs
				if (isInput) {
					// Only allow Escape and F-keys in inputs
					if (event.key !== "Escape" && !event.key.startsWith("F")) {
						return;
					}
				}
			}

			for (const shortcut of shortcutsRef.current) {
				// Skip disabled shortcuts
				if (shortcut.enabled === false) continue;

				// Check modifiers
				const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
				const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
				const altMatch = shortcut.alt ? event.altKey : !event.altKey;

				// Check key (case-insensitive for letters)
				const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
					event.code.toLowerCase() === `key${shortcut.key.toLowerCase()}`;

				if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
					if (shortcut.preventDefault !== false) {
						event.preventDefault();
					}
					shortcut.action();
					return; // Only trigger first matching shortcut
				}
			}
		},
		[disableInInputs]
	);

	useEffect(() => {
		const target = isGlobal ? window : document;
		target.addEventListener("keydown", handleKeyDown as EventListener);

		return () => {
			target.removeEventListener("keydown", handleKeyDown as EventListener);
		};
	}, [handleKeyDown, isGlobal]);
}

/**
 * Get platform-aware modifier key symbol
 */
export function getModifierSymbol(): string {
	if (typeof navigator === "undefined") return "Ctrl";
	return navigator.platform?.includes("Mac") ? "⌘" : "Ctrl";
}

/**
 * Format a shortcut for display
 */
export function formatShortcut(shortcut: Pick<KeyboardShortcut, "key" | "ctrl" | "shift" | "alt">): string {
	const parts: string[] = [];
	
	if (shortcut.ctrl) parts.push(getModifierSymbol());
	if (shortcut.shift) parts.push("Shift");
	if (shortcut.alt) parts.push("Alt");
	
	// Format special keys nicely
	const keyDisplay = {
		"Enter": "↵",
		"Escape": "Esc",
		"ArrowUp": "↑",
		"ArrowDown": "↓",
		"ArrowLeft": "←",
		"ArrowRight": "→",
		" ": "Space",
	}[shortcut.key] || shortcut.key.toUpperCase();
	
	parts.push(keyDisplay);
	
	return parts.join("+");
}

export default useKeyboardShortcuts;
