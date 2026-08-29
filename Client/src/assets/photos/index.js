// Real photos for the public site — sourced from Pixabay (free for
// commercial use, no attribution required under the Pixabay Content
// License: https://pixabay.com/service/license-summary/). Each URL was
// verified to actually resolve before download.
import classroomChildren from './classroom-children.jpg';
import schoolgirlsOutdoor from './schoolgirls-outdoor.jpg';
import volunteerWithChildren from './volunteer-with-children.jpg';
import childPortrait from './child-portrait.jpg';
import childrenWithLaptops from './children-with-laptops.jpg';

export const photos = {
  classroomChildren,
  schoolgirlsOutdoor,
  volunteerWithChildren,
  childPortrait,
  childrenWithLaptops,
};

// One photo per program category, for event cards — falls back to the
// classroom photo for any category this doesn't recognize.
const EVENT_PHOTOS_BY_CATEGORY = {
  Education: schoolgirlsOutdoor,
  Healthcare: childPortrait,
  'Digital Literacy': childrenWithLaptops,
  Community: volunteerWithChildren,
};

export function eventPhotoFor(category) {
  return EVENT_PHOTOS_BY_CATEGORY[category] || classroomChildren;
}
