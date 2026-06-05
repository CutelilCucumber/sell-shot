const prisma = require('./prismaClient');

async function getAllTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } });
}

async function deleteTag(id) {
  return prisma.tag.delete({ where: { id } });
}

async function updateTag(id, name) {
  return prisma.tag.update({
    where: { id },
    data: { name: name.toLowerCase().trim() }
  });
}

module.exports = {
  getAllTags,
  deleteTag,
  updateTag
};