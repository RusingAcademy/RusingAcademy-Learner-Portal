import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Badge CDN URLs from uploads
const BADGE_DATA = {
  // Path I (courseId=1, modules 60003-60006)
  1: {
    pathBadge: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/qmigRYTyBeAwITlH.png',
    modules: {
      60003: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/bMImIICabZJeTMan.png',
      60004: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/lXVtSAvbYJpCxVWM.png',
      60005: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/FJUibpRouvSQKLpd.png',
      60006: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/IXHZVsEZynxkjjWv.png',
    }
  },
  // Path II (courseId=2, modules 60007-60010)
  2: {
    pathBadge: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/RnWkfcJuLTKIjcYt.png',
    modules: {
      60007: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/KVgMKQMEVdywdeVa.png',
      60008: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/NQIYmbcZguPJhwzq.png',
      60009: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/kgTsafYsDIOyaPil.png',
      60010: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/PdNmWCecjQlKcqNE.png',
    }
  },
  // Path III (courseId=3, modules 60011-60014)
  3: {
    pathBadge: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/BlUkfFYjmEePDUwW.png',
    modules: {
      60011: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/IVqTfjgGYsSccRPR.png',
      60012: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/GZzmvmoNGzLCVMTz.png',
      60013: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/jKcUrrwFsgaQYRQf.png',
      60014: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/NjWbGECwouFAVQkT.png',
    }
  },
  // Path IV (courseId=4, modules 60015-60018)
  4: {
    pathBadge: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/xYbQwqlTSoXizPqo.png',
    modules: {
      60015: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/OhBkPAEuDDZJfvTN.png',
      60016: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/LpIZRMaakNdmxoFr.png',
      60017: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/bUxRgpQgQigGkYwQ.png',
      60018: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/uFOkKvBBdrZvULlz.png',
    }
  },
  // Path V (courseId=5, modules 60019-60022)
  5: {
    pathBadge: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/WRkfoKEGxVifdTQF.png',
    modules: {
      60019: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/nChofnWOOBtgJIQN.png',
      60020: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/wsGNgzYylioYoikO.png',
      60021: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/wNnbwxixgUugjWVU.png',
      60022: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/sVGYmgLYsxFfjQoQ.png',
    }
  },
  // Path VI (courseId=6, modules 60023-60026)
  6: {
    pathBadge: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/QQyHRjRLLAlYCuns.png',
    modules: {
      60023: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/GfHCfmbKnJruQpOm.png',
      60024: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/VEFhEatLaFzbVQCP.png',
      60025: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/GqYEhVSiVoyvigBp.png',
      60026: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/NMiRXOwLkiVCuItd.png',
    }
  },
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Update course path completion badges
  for (const [courseId, data] of Object.entries(BADGE_DATA)) {
    await conn.query(
      'UPDATE courses SET pathCompletionBadgeUrl = ? WHERE id = ?',
      [data.pathBadge, courseId]
    );
    console.log(`Course ${courseId}: path badge set`);
    
    // Update module badges
    for (const [moduleId, badgeUrl] of Object.entries(data.modules)) {
      await conn.query(
        'UPDATE course_modules SET badgeImageUrl = ? WHERE id = ?',
        [badgeUrl, moduleId]
      );
      console.log(`  Module ${moduleId}: badge set`);
    }
  }
  
  // Verify
  const [courses] = await conn.query('SELECT id, title, pathCompletionBadgeUrl FROM courses WHERE id <= 6 ORDER BY id');
  console.log('\nVerification - Courses:');
  for (const c of courses) {
    console.log(`  ${c.id}: ${c.pathCompletionBadgeUrl ? 'HAS BADGE' : 'NO BADGE'}`);
  }
  
  const [modules] = await conn.query('SELECT id, courseId, badgeImageUrl FROM course_modules ORDER BY courseId, sortOrder');
  console.log('\nVerification - Modules:');
  for (const m of modules) {
    console.log(`  Module ${m.id} (course ${m.courseId}): ${m.badgeImageUrl ? 'HAS BADGE' : 'NO BADGE'}`);
  }
  
  await conn.end();
}
main().catch(console.error);
