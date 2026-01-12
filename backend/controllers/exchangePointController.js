import exchangePointService from '../services/exchangePointService.js';

class ExchangePointController {
    async createPoint(req, res) {
        try {
            const pointData = {
                owner_id: req.body.owner_id,
                name: req.body.name,
                location: req.body.location,
                contact_info: req.body.contact_info,
                description: req.body.description,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                contact_phone: req.body.contact_phone,
                contact_email: req.body.contact_email,
                timing: req.body.timing,
                opening_date: req.body.opening_date,
                is_active: req.body.is_active !== undefined ? req.body.is_active : true
            };

            const point = await exchangePointService.createPoint(
                pointData.owner_id,
                pointData.name,
                pointData.location,
                pointData.contact_info,
                req.authToken
            );

            // Update additional fields if provided
            if (pointData.description || pointData.latitude || pointData.longitude ||
                pointData.contact_phone || pointData.contact_email || pointData.timing || pointData.opening_date) {
                const updateData = {};
                if (pointData.description) updateData.description = pointData.description;
                if (pointData.latitude) updateData.latitude = pointData.latitude;
                if (pointData.longitude) updateData.longitude = pointData.longitude;
                if (pointData.contact_phone) updateData.contact_phone = pointData.contact_phone;
                if (pointData.contact_email) updateData.contact_email = pointData.contact_email;
                if (pointData.timing) updateData.timing = pointData.timing;
                if (pointData.opening_date) updateData.opening_date = pointData.opening_date;
                if (pointData.is_active !== undefined) updateData.is_active = pointData.is_active;

                const updatedPoint = await exchangePointService.updatePoint(point.id, updateData, req.authToken);
                res.status(201).json(updatedPoint);
            } else {
                res.status(201).json(point);
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllPoints(req, res) {
        try {
            const points = await exchangePointService.getAllPoints(req.authToken);
            res.json(points);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updatePoint(req, res) {
        try {
            const pointId = req.params.id;
            const point = await exchangePointService.updatePoint(pointId, req.body, req.authToken);
            res.json(point);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deletePoint(req, res) {
        try {
            const pointId = req.params.id;
            await exchangePointService.deletePoint(pointId, req.authToken);
            res.json({ message: 'Exchange point deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new ExchangePointController();
