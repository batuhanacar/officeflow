package com.example.officeflow.security;

import com.example.officeflow.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. İstekten JWT'yi al
            String jwt = getJwtFromRequest(request);

            // 2. Token var mı ve kullanıcı daha önce doğrulanmamış mı diye kontrol et
            if (StringUtils.hasText(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 3. Token'dan kullanıcı adını al
                String username = tokenProvider.getUsernameFromToken(jwt);

                // 4. Veritabanından kullanıcı bilgilerini (UserDetails) yükle
                // Bu adımın başarılı olduğunu konsol loglarımızdan zaten biliyoruz.
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                // 5. Token'ın bu kullanıcıya ait ve geçerli olup olmadığını kontrol et
                // NullPointerException hatasını önlemek için kontrolü sadece burada yapıyoruz.
                if (tokenProvider.isTokenValid(jwt, userDetails)) {
                    // Spring Security'nin anlayacağı bir kimlik doğrulama nesnesi oluştur
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Kimlik doğrulama bilgisini SecurityContextHolder'a yerleştir.
                    // Bu, kullanıcının bu istek için geçerli olduğunu ve yetkilerinin tanındığını gösterir.
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            // Hata ayıklama için: Filtrede bir hata olursa konsola yazdır.
            logger.error("Kimlik doğrulama filtresinde hata oluştu", ex);
        }

        // Filtre zincirindeki bir sonraki adıma devam et
        filterChain.doFilter(request, response);
    }

    /**
     * İsteklerin "Authorization" header'ından "Bearer <token>" formatındaki JWT'yi ayıklar.
     * @param request Gelen HTTP isteği.
     * @return JWT string'i veya bulunamazsa null.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}