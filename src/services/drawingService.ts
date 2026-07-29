import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export const uploadDrawing = async (
    file: File,
    token: string
) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
        `${API}/drawings/upload`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};