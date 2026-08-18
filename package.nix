{
  lib,
  stdenvNoCC,
  makeWrapper,
  nodejs,
}:
stdenvNoCC.mkDerivation {
  name = "hamr";

  src = ./.;

  nativeBuildInputs = [ makeWrapper ];

  installPhase = ''
    runHook preInstall
    mkdir -p $out/bin $out/lib/docs
    cp docs/alphabets.js docs/compress.js $out/lib/docs
    cp standalone.js $out/lib
    makeWrapper ${lib.getExe nodejs} $out/bin/hamr \
      --add-flags "$out/lib/standalone.js"
    runHook preInstall
  '';

  meta = {
    description = "Static URL compressor and QR code optimizer";
    homepage = "https://github.com/p2r3/ha.mr";
    mainProgram = "hamr";
    license = lib.licenses.mit;
  };
}
