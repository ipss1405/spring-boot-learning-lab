#!/bin/sh
set -e
MAVEN_VERSION="3.9.11"
BASE_DIR="${HOME}/.m2/wrapper/dists"
MAVEN_HOME="${BASE_DIR}/apache-maven-${MAVEN_VERSION}"
ARCHIVE="${BASE_DIR}/apache-maven-${MAVEN_VERSION}-bin.zip"
URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/${MAVEN_VERSION}/apache-maven-${MAVEN_VERSION}-bin.zip"

if [ ! -x "${MAVEN_HOME}/bin/mvn" ]; then
  mkdir -p "${BASE_DIR}"
  echo "Descargando Maven ${MAVEN_VERSION}..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "${URL}" -o "${ARCHIVE}"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "${URL}" -O "${ARCHIVE}"
  else
    echo "Se necesita curl o wget para descargar Maven." >&2
    exit 1
  fi
  unzip -q -o "${ARCHIVE}" -d "${BASE_DIR}"
fi

exec "${MAVEN_HOME}/bin/mvn" "$@"
