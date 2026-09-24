#!/usr/bin/env node
/**
 * validate_phone_contracts.cjs
 * Validates all 100 phone lesson contracts for schema completeness,
 * goal coverage, and goal type assignment.
 *
 * Exit code 0 = all contracts pass schema validation.
 * Warnings (ambiguous goal types) do not cause non-zero exit.
 * Exit code 1 = at least one contract has a structural failure.
 *
 * Usage: node scripts/validate_phone_contracts.cjs
 */

'use strict';

// Register tsx for TypeScript imports
require('../tests/register.cjs');

const { PHONE_CONTRACTS_01_50 } = require('../src/data/phone/lessons01_50.ts');
const { PHONE_CONTRACTS_51_100 } = require('../src/data/phone/lessons51_100.ts');
const { inferGoalType } = require('../src/lib/goalTypeResolver.ts');

const ALL_CONTRACTS = { ...PHONE_CONTRACTS_01_50, ...PHONE_CONTRACTS_51_100 };
const REQUIRED_LESSON_RANGE = Array.from({ length: 100 }, (_, i) => i + 1);

const GOAL_TYPES = new Set([
  'information_retrieval', 'student_action', 'agreement', 'acknowledgement', 'other',
]);

let failures = 0;
let warnings = 0;
const ambiguousGoals = []; // { lesson, goalIndex, goalText }

/**
 * Validate a single contract. Returns { ok: boolean, issues: string[], warns: string[] }
 */
function validateContract(lessonNumber, contract) {
  const issues = [];
  const warns = [];

  // 1. Required string fields
  for (const field of ['callerName', 'callerNameRu', 'callerRole', 'situationSummary',
    'callerObjective', 'studentObjective', 'completionCondition', 'memoryScope']) {
    if (typeof contract[field] !== 'string' || !contract[field].trim()) {
      issues.push(`Missing or empty field: ${field}`);
    }
  }

  // 2. callerGender
  if (!['male', 'female'].includes(contract.callerGender)) {
    issues.push(`Invalid callerGender: ${contract.callerGender}`);
  }

  // 3. callType
  if (!['incoming', 'outgoing'].includes(contract.callType)) {
    issues.push(`Invalid callType: ${contract.callType}`);
  }

  // 4. targetTurns
  if (contract.targetTurns !== 3 && contract.targetTurns !== 4) {
    issues.push(`Invalid targetTurns: ${contract.targetTurns} (must be 3 or 4)`);
  }

  // 5. goals[]
  if (!Array.isArray(contract.goals) || contract.goals.length === 0) {
    issues.push('goals[] is missing or empty');
  } else {
    contract.goals.forEach((g, i) => {
      if (typeof g !== 'string' || !g.trim()) {
        issues.push(`goals[${i}] is empty or not a string`);
      }
    });

    // 6. goalTypes[] if present — must be aligned with goals.length
    if (contract.goalTypes !== undefined) {
      if (!Array.isArray(contract.goalTypes)) {
        issues.push('goalTypes must be an array if present');
      } else if (contract.goalTypes.length !== contract.goals.length) {
        issues.push(`goalTypes.length (${contract.goalTypes.length}) !== goals.length (${contract.goals.length})`);
      } else {
        contract.goalTypes.forEach((t, i) => {
          if (!GOAL_TYPES.has(t)) {
            issues.push(`goalTypes[${i}] has invalid value: "${t}"`);
          }
        });
      }
    }

    // 7. Auto-infer types and flag 'other' as warnings
    const resolvedTypes = contract.goals.map((g, i) => {
      if (contract.goalTypes && contract.goalTypes[i] !== undefined) {
        return contract.goalTypes[i];
      }
      return inferGoalType(g);
    });

    resolvedTypes.forEach((type, i) => {
      if (type === 'other') {
        warns.push(`goals[${i}] type='other' (ambiguous): «${contract.goals[i]}»`);
        ambiguousGoals.push({ lesson: lessonNumber, goalIndex: i, goalText: contract.goals[i] });
      }
    });

    // 8. informationEvidence keys must align with information_retrieval goals
    if (contract.informationEvidence) {
      const infoIndices = new Set(
        resolvedTypes.map((t, i) => t === 'information_retrieval' ? i : -1).filter(i => i >= 0)
      );
      Object.keys(contract.informationEvidence).forEach(k => {
        const idx = Number(k);
        if (!infoIndices.has(idx)) {
          warns.push(`informationEvidence[${idx}] defined but goals[${idx}] is not information_retrieval type`);
        }
      });
    }
  }

  // 9. facts[]
  if (!Array.isArray(contract.facts) || contract.facts.length === 0) {
    issues.push('facts[] is missing or empty');
  }

  // 10. studentDetails[]
  if (!Array.isArray(contract.studentDetails)) {
    issues.push('studentDetails[] must be an array');
  }

  // 11. forbiddenActions[]
  if (!Array.isArray(contract.forbiddenActions) || contract.forbiddenActions.length === 0) {
    issues.push('forbiddenActions[] is missing or empty');
  }

  // 12. greeting
  if (!contract.greeting || typeof contract.greeting !== 'object') {
    issues.push('greeting is missing');
  } else {
    for (const gender of ['male', 'female']) {
      const g = contract.greeting[gender];
      if (!g || typeof g.hebrew !== 'string' || !/[\u05d0-\u05ea]/.test(g.hebrew)) {
        issues.push(`greeting.${gender}.hebrew is missing or contains no Hebrew characters`);
      }
      if (!g || typeof g.transcription !== 'string' || !g.transcription.trim()) {
        issues.push(`greeting.${gender}.transcription is missing`);
      }
      if (!g || typeof g.translation !== 'string' || !g.translation.trim()) {
        issues.push(`greeting.${gender}.translation is missing`);
      }
    }
  }

  return { ok: issues.length === 0, issues, warns };
}

// ─── Main ───────────────────────────────────────────────────────────────────

const results = [];

for (const lessonNumber of REQUIRED_LESSON_RANGE) {
  const contract = ALL_CONTRACTS[lessonNumber];
  if (!contract) {
    results.push({ lesson: lessonNumber, status: 'FAIL', issues: ['Contract not found'], warns: [] });
    failures++;
    continue;
  }

  const { ok, issues, warns } = validateContract(lessonNumber, contract);
  const status = ok ? (warns.length > 0 ? 'WARN' : 'OK  ') : 'FAIL';
  results.push({ lesson: lessonNumber, status, issues, warns });
  if (!ok) failures++;
  if (warns.length) warnings += warns.length;
}

// ─── Output ─────────────────────────────────────────────────────────────────

for (const r of results) {
  const goalCount = ALL_CONTRACTS[r.lesson]?.goals?.length ?? 0;
  const line = `[${r.status}] Lesson ${String(r.lesson).padStart(3, ' ')}: ${goalCount} goal(s)`;
  console.log(line);
  for (const issue of r.issues) console.log(`         ❌ ${issue}`);
  for (const warn of r.warns) console.log(`         ⚠️  ${warn}`);
}

console.log('\n─────────────────────────────────────────────────────────');
console.log(`Lessons checked: ${REQUIRED_LESSON_RANGE.length}`);
console.log(`Schema failures: ${failures}`);
console.log(`Ambiguous types (author review needed): ${ambiguousGoals.length}`);

if (ambiguousGoals.length > 0) {
  console.log('\nAmbiguous goals (inferred as \'other\'):');
  for (const ag of ambiguousGoals) {
    console.log(`  Lesson ${ag.lesson}, goal[${ag.goalIndex}]: «${ag.goalText}»`);
  }
}

if (failures > 0) {
  console.error(`\n❌ ${failures} contract(s) failed schema validation.`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${REQUIRED_LESSON_RANGE.length} contracts pass schema validation.`);
  process.exit(0);
}
