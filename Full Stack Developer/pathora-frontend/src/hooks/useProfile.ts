import { useState, useEffect } from "react";
import { userService } from "../services/user.service";
import { analysisService } from "../services/analysis.service";

import { User, UpdateProfileRequest } from "../types/auth";
import { Analysis } from "../types/analysis";

import { parseApiError } from "../utils/error";

export interface ProfileState {
    user: User | null;
    analyses: Analysis[];
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
}

export function useProfile() {
    const [state, setState] = useState<ProfileState>({
        user: null,
        analyses: [],
        isLoading: true,
        isUpdating: false,
        error: null,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setState((prev) => ({
                ...prev,
                isLoading: true,
                error: null,
            }));

            const [user, analysesResponse] = await Promise.all([
                userService.getProfile(),
                analysisService.getAnalyses(1, 100),
            ]);

            setState((prev) => ({
                ...prev,
                user,
                analyses: analysesResponse.analyses,
                isLoading: false,
            }));
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                error: parseApiError(error),
                isLoading: false,
            }));
        }
    };

    const updateProfile = async (
        payload: UpdateProfileRequest
    ): Promise<User | null> => {
        try {
            setState((prev) => ({
                ...prev,
                isUpdating: true,
                error: null,
            }));

            const updatedUser =
                await userService.updateProfile(payload);

            setState((prev) => ({
                ...prev,
                user: updatedUser,
                isUpdating: false,
            }));

            return updatedUser;
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                error: parseApiError(error),
                isUpdating: false,
            }));

            return null;
        }
    };

    return {
        ...state,
        refresh: fetchProfile,
        updateProfile,
    };
}