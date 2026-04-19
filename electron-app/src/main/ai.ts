export async function suggestTitle(_description: string): Promise<string> {
  // call LLM here
  return 'temporary title'
}

export async function generateResumeSnapshot(
  _recentCheckpoints: Array<{
    description: string
    evidence: string[]
    createdAt: string
  }>
): Promise<string> {
  // call LLM here
  return 'temporary snapshot'
}
