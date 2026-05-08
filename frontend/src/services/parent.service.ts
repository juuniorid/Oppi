import { User } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import {
    extractErrorMessage,
    fetchWithAuth,
    parseJson,
    unwrapData,
} from '@/services/http.service';

class ParentService {
    async getAllParentsList(): Promise<User[]> {
        const response = await fetchWithAuth(apiUrl(apiPaths.parents.list));
        const data = await parseJson(response);

        if (!response.ok) {
            throw new Error(extractErrorMessage(data, `Failed to load parents (${response.status})`));
        }

        // Since our backend returns fields matching the User type, we can cast it
        return unwrapData<User[]>(data, []);
    }
}

const parentService = new ParentService();

export default parentService;