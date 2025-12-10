import { apiClient } from './api';
import { ContactInfoDTO } from '@cloud-capital/shared';

export const contactService = {
  async getContactInfo(): Promise<ContactInfoDTO> {
    const response = await apiClient.get('/contact');
    return response.data;
  },
};
