import type { FastifyReply } from 'fastify';
import prisma from '../../../../../structures/database';
import { RequestWithUser } from '../../../../../structures/interfaces';

interface body {
	identifier: string;
}

export const middlewares = ['auth'];

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	if (!req.params) return res.status(400).send({ message: 'No body provided' });
	const { identifier } = req.body as body;
	if (!identifier) return res.status(400).send({ message: 'No identifier provided' });

	const link = await prisma.links.findFirst({
		where: {
			userId: req.user.id,
			identifier
		}
	});

	if (!link) return res.status(400).send({ message: 'No link found' });

	await prisma.links.delete({
		where: {
			links_userid_identifier_unique: {
				userId: req.user.id,
				identifier
			}
		}
	});

	await prisma.albumsLinks.delete({
		where: {
			linkId: link.id
		}
	});

	return res.send({
		message: 'Successfully deleted the link'
	});
};