import ExchangePointModel from '../models/exchangePointModel.js';

class ExchangePointService {
    async createPoint(ownerId, name, location, contactInfo, authToken) {
        if (!ownerId || !name || !location) {
            throw new Error('Owner ID, name, and location are required');
        }

        const pointData = {
            owner_id: ownerId,
            name: name,
            location: location,
            contact_info: contactInfo
        };

        return await ExchangePointModel.createPoint(pointData, authToken);
    }

    async getAllPoints(authToken) {
        const points = await ExchangePointModel.getAllPoints(authToken);
        return { exchangePoints: points };
    }

    async updatePoint(pointId, updates, authToken) {
        if (!pointId) {
            throw new Error('Point ID is required');
        }

        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.location !== undefined) updateData.location = updates.location;
        if (updates.contact_info !== undefined) updateData.contact_info = updates.contact_info;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
        if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
        if (updates.contact_phone !== undefined) updateData.contact_phone = updates.contact_phone;
        if (updates.contact_email !== undefined) updateData.contact_email = updates.contact_email;
        if (updates.timing !== undefined) updateData.timing = updates.timing;
        if (updates.opening_date !== undefined) updateData.opening_date = updates.opening_date;
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

        return await ExchangePointModel.updatePoint(pointId, updateData, authToken);
    }

    async deletePoint(pointId, authToken) {
        if (!pointId) {
            throw new Error('Point ID is required');
        }
        return await ExchangePointModel.deletePoint(pointId, authToken);
    }
}

export default new ExchangePointService();
