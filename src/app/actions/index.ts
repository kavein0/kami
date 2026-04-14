// Barrel re-export — all domain actions from a single import path
export { registerAction, loginAction, logoutAction } from "./auth";
export { addToList, removeFromList, updateListEntry, submitReview } from "./list";
export { toggleFollow, searchUsers } from "./social";
export { setLanguage, updateProfile } from "./preferences";
export { loadMoreTitles } from "./browse";
