// hooks/useProfilePhoto.ts

import { useState } from "react";
import { userService } from "../services/user.service";

export function useProfilePhoto() {
    const [isUploading, setIsUploading] = useState(false);

    const uploadPhoto = async (file: File) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("photo", file);

            const result =
                await userService.uploadProfilePhoto(formData);

            return result;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadPhoto,
        isUploading,
    };
}