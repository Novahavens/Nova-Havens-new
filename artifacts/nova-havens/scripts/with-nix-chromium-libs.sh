#!/usr/bin/env bash

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <command> [args...]" >&2
  exit 64
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# Replit exports this path from the active Nix environment. Keep any caller
# paths after it so this wrapper remains composable with other tooling.
library_path="${REPLIT_LD_LIBRARY_PATH:-}"
if [[ -n "${LD_LIBRARY_PATH:-}" ]]; then
  library_path="${library_path:+$library_path:}${LD_LIBRARY_PATH}"
fi

find_chromium_binaries() {
  local candidate
  local root
  local roots=()

  if [[ -n "${REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE:-}" ]]; then
    roots+=("${REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE}")
  fi

  roots+=(
    "${PLAYWRIGHT_BROWSERS_PATH:-}"
    "${HOME:-}/.cache/ms-playwright"
    "${PWD}/.cache/ms-playwright"
    "${script_dir}/../../../.cache/ms-playwright"
  )

  for root in "${roots[@]}"; do
    [[ -z "$root" ]] && continue

    if [[ -f "$root" && -x "$root" ]]; then
      printf '%s\n' "$root"
      continue
    fi

    if [[ -d "$root" ]]; then
      while IFS= read -r candidate; do
        printf '%s\n' "$candidate"
      done < <(
        find "$root" -type f \( -name chrome -o -name chrome-headless-shell \) -perm -111 -print 2>/dev/null ||
          true
      )
    fi
  done | sort -u
}

append_library_path() {
  local directory="$1"

  [[ -d "$directory" ]] || return
  case ":$library_path:" in
    *":$directory:"*) ;;
    *) library_path="${library_path:+$library_path:}$directory" ;;
  esac
}

find_nix_references() {
  local input

  command -v nix-store >/dev/null || return
  for input in ${buildInputs:-}; do
    [[ "$input" == /nix/store/* ]] || continue
    printf '%s\n' "$input"
    nix-store -q --references "$input" 2>/dev/null || true
  done | sort -u
}

mapfile -t chromium_binaries < <(find_chromium_binaries || true)
if [[ ${#chromium_binaries[@]} -gt 0 && -x "$(command -v ldd)" ]]; then
  mapfile -t nix_references < <(find_nix_references)

  missing="$(
    for chromium in "${chromium_binaries[@]}"; do
      LD_LIBRARY_PATH="$library_path" ldd "$chromium" 2>&1 |
        sed -nE 's/^[[:space:]]*(lib[^[:space:]]+) => not found$/\1/p' ||
        true
    done | sort -u
  )"

  while IFS= read -r library; do
    [[ -n "$library" ]] || continue
    for reference in "${nix_references[@]}"; do
      if [[ -f "$reference/lib/$library" ]]; then
        append_library_path "$reference/lib"
      fi
    done
  done <<< "$missing"

  remaining="$(
    for chromium in "${chromium_binaries[@]}"; do
      LD_LIBRARY_PATH="$library_path" ldd "$chromium" 2>&1 |
        sed -nE 's/^[[:space:]]*(lib[^[:space:]]+) => not found$/\1/p' ||
        true
    done | sort -u
  )"
  if [[ -n "$remaining" ]]; then
    echo "Unable to resolve Chromium libraries: $remaining" >&2
    echo "Check the active Nix dependencies in replit.nix." >&2
    exit 1
  fi
fi

export LD_LIBRARY_PATH="$library_path"
exec "$@"