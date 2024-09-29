import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-root-toast";

export const formatSlug = (slug: string | null) => {
    if (!slug) return "";
    return slug.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
};

export const inverseFormatSlug = (title: string | null) => {
    if (!title) return "";
    return title.split(" ").map((word) => word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()).join()
};


export const copySlug = async (slug: string | null) => {
    if(!slug) return;
    await Clipboard.setStringAsync(formatSlug(slug));

    Toast.show("Copied Call ID to clipboard!", {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        backgroundColor: "#333",
        textColor: "#fff",
    }
    )
}