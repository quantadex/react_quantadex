

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
	return [
		"OPEN.",
		"RUDEX.",
		"WIN.",
		"BRIDGE.",
		"GDEX.",
		"XBTSX.",
		"SPARKDEX.",
		"CITADEL."
	];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for BitAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
	// e..g "OPEN.", "bit"
	return [];
}
