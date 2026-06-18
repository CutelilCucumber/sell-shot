const { identifyItem } = require('../server/utils/localIdentify.js');

// a publicly accessible test image — a clothing item on white background
const TEST_IMAGE_URL = 
'https://scontent.fsan1-2.fna.fbcdn.net/v/t39.84726-6/723333853_1450400756776132_5997452865140775319_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=108&ccb=1-7&_nc_sid=92e707&_nc_ohc=pFjPhjh3rWwQ7kNvwGNXYC8&_nc_oc=AdobPZYKHK2hpf8obUJFFM26XpRgkp7e5zvZoA39sJfd8ZgAdfLQETYFgwlscLo61aqbSLh4mAIsDMH65_j8gy2b&_nc_zt=14&_nc_ht=scontent.fsan1-2.fna&_nc_gid=HYJJ59dCCjh1sBVriu8hmg&_nc_ss=7b2a8&oh=00_Af8XVJvzrw-hIqZI7F1_j0UYFfEDBJsjMXcTdVI_8Dm9BA&oe=6A3A1C3E';

async function runTest() {
  console.log('Testing identifyItem with image:', TEST_IMAGE_URL);
  console.log('─'.repeat(50));

  try {
    console.time('identification');
    const result = await identifyItem(TEST_IMAGE_URL);
    console.timeEnd('identification');

    console.log('\n✓ Parsed successfully\n');
    console.log('Result:', JSON.stringify(result, null, 2));

    // basic shape validation
    const expected = ['title', 'brand', 'category', 'color', 'material',
       'condition', 'estimatedPrice', 'tags', 'description'];
    const missing = expected.filter(key => !(key in result));
    const extra = Object.keys(result).filter(key => !expected.includes(key));

    if (missing.length) console.warn('⚠ Missing fields:', missing);
    if (extra.length) console.warn('⚠ Unexpected fields:', extra);
    if (!missing.length && !extra.length) console.log('✓ All expected fields present');

    if (!Array.isArray(result.tags.value)) console.warn('⚠ tags should be an array');
    else console.log('✓ tags is an array:', result.tags.value);

    if (result.estimatedPrice.value !== null && typeof result.estimatedPrice.value !== 'number') {
      console.warn('⚠ estimatedPrice should be a number or null, got:', typeof result.estimatedPrice.value);
    } else {
      console.log('✓ estimatedPrice type ok:', result.estimatedPrice.value);
    }

    const validCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];
    if (result.category.value && !validCategories.includes(result.category.value)) {
      console.warn('⚠ unexpected category:', result.category.value);
    } else {
      console.log('✓ category ok:', result.category.value);
    }

    const validConditions = ['new_with_tags', 'like_new', 'good', 'fair', 'poor'];
    if (result.condition && !validConditions.includes(result.condition.value)) {
      console.warn('⚠ unexpected condition:', result.condition.value);
    } else {
      console.log('✓ condition ok:', result.condition.value);
    }

  } catch (err) {
    console.error('\n✗ Test failed:', err.message);
    if (err instanceof SyntaxError) {
      console.error('  → JSON parse error — model returned non-JSON output');
    }
    process.exit(1);
  }
}

runTest();