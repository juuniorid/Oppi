import { Child } from '@/types';

class ChildService {
  async getChildrenByGroup(groupId: number): Promise<Child[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/children/group/${groupId}`,
      { credentials: 'include' },
    );
    const data = await response.json();
    return data;
  }
}

const childService = new ChildService();

export default childService;
