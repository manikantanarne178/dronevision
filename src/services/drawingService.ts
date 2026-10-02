import API from "../api";

export const uploadDrawing = async (
    file: File
) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post(
        "/api/drawings/upload",
        formData
    );

    return response.data;
};