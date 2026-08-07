import snapshot from "./snapshot.json"
import {
  parsePublishedContentSnapshot,
  type PublishedContentSnapshot,
} from "./model"
import { SnapshotContentRepository } from "./repository"

export class GitSnapshotRepository extends SnapshotContentRepository {
  private readonly snapshot: PublishedContentSnapshot

  constructor(value: unknown = snapshot) {
    super()
    this.snapshot = parsePublishedContentSnapshot(value)
  }

  async getPublishedSnapshot() {
    return this.snapshot
  }
}
